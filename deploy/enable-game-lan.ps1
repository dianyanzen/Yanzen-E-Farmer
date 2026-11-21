# Run in elevated PowerShell with the host IPv4 and existing allowed-rule names.
param(
    [Parameter(Mandatory = $true)]
    [System.Net.IPAddress]$ListenAddress,
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string[]]$SourceRuleNames
)

$ErrorActionPreference = 'Stop'
$principal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Buka PowerShell sebagai Administrator untuk menjalankan skrip ini.'
}

$listenAddress = $ListenAddress.IPAddressToString
$proxyPort = 3002
$rules = foreach ($name in $SourceRuleNames) {
    $source = Get-NetFirewallRule -PolicyStore ActiveStore -DisplayName $name
    $port = Get-NetFirewallPortFilter -AssociatedNetFirewallRule $source
    $address = Get-NetFirewallAddressFilter -AssociatedNetFirewallRule $source
    if ($source.Enabled -ne 'True' -or $source.Direction -ne 'Inbound' -or
        $source.Action -ne 'Allow' -or $port.Protocol -ne 'TCP' -or
        $port.LocalPort -ne '3273' -or $source.EdgeTraversalPolicy -ne 'Block') {
        throw "Aturan sumber berubah: $name"
    }
    @{ DisplayName = "YZ Farm Life TCP 3002 - $name"
       RemoteAddress = $address.RemoteAddress; Profile = $source.Profile }
}

Get-NetIPAddress -AddressFamily IPv4 -IPAddress $listenAddress | Out-Null
$health = Invoke-RestMethod -Uri 'http://127.0.0.1:3002/api/health' -TimeoutSec 5
if ($health.status -ne 'ok' -or $health.database -ne 'ok') {
    throw 'Game lokal belum sehat.'
}
if ((Get-Service iphlpsvc).Status -ne 'Running') {
    throw 'Layanan Windows IP Helper harus aktif untuk portproxy.'
}

foreach ($rule in $rules) {
    $existing = Get-NetFirewallRule -DisplayName $rule.DisplayName -ErrorAction SilentlyContinue
    if ($existing) {
        Set-NetFirewallRule @rule -Enabled True -Direction Inbound -Action Allow -Protocol TCP -LocalAddress $listenAddress -LocalPort $proxyPort -EdgeTraversalPolicy Block
    } else {
        New-NetFirewallRule @rule -Enabled True -Direction Inbound -Action Allow -Protocol TCP -LocalAddress $listenAddress -LocalPort $proxyPort -EdgeTraversalPolicy Block | Out-Null
    }
    Get-NetFirewallRule -PolicyStore ActiveStore -DisplayName $rule.DisplayName | Out-Null
}

$portProxy = & netsh interface portproxy show v4tov4
$escapedListenAddress = [regex]::Escape($listenAddress)
$existingProxy = $portProxy | Where-Object { $_ -match "^\s+$escapedListenAddress\s+3002\s+" }
if ($existingProxy) {
    if ($existingProxy -notmatch "^\s+$escapedListenAddress\s+3002\s+127\.0\.0\.1\s+3002\s*$") {
        throw 'Portproxy 3002 sudah dipakai tujuan lain.'
    }
} else {
    & netsh interface portproxy add v4tov4 listenaddress=$listenAddress listenport=$proxyPort connectaddress=127.0.0.1 connectport=$proxyPort
    if ($LASTEXITCODE -ne 0) { throw 'Windows gagal memasang portproxy 3002.' }
}

$health = Invoke-RestMethod -Uri "http://${listenAddress}:${proxyPort}/api/health" -TimeoutSec 5
if ($health.status -ne 'ok' -or $health.database -ne 'ok') {
    throw 'Endpoint game di alamat LAN belum sehat.'
}
Write-Output "Endpoint LAN aktif: http://${listenAddress}:${proxyPort}/game"
