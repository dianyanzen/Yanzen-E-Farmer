// Test-only HTTP contract. Browser contexts isolate data; tabs in one
// context share the same save and see the same optimistic concurrency token.
export const apiFixture = `<script>
const nativeFetch = window.fetch.bind(window);
const storageKey = 'yz-test-save';
window.fetch = async (url, options = {}) => {
  if (url === '/api/auth/session') {
    return Response.json({user:{id:'10000000-0000-0000-0000-000000000001'}});
  }
  if (url !== '/api/game/save') return nativeFetch(url, options);

  const current = JSON.parse(localStorage.getItem(storageKey) || '{"data":null}');
  if (options.method !== 'PUT') return Response.json(current);
  window.__saveAttempts = (window.__saveAttempts || 0) + 1;
  if (window.__failSave) return Response.json({error:'offline'}, {status:503});

  const {data, expectedUpdatedAt} = JSON.parse(options.body);
  if (expectedUpdatedAt !== (current.updatedAt ?? null)) {
    return Response.json({error:'conflict'}, {status:409});
  }
  const previousTime = current.updatedAt ? Date.parse(current.updatedAt) : 0;
  const updatedAt = new Date(Math.max(Date.now(), previousTime + 1)).toISOString();
  localStorage.setItem(storageKey, JSON.stringify({data, updatedAt}));
  return Response.json({updatedAt});
};
</script>`;

// Move between browser scenarios while preserving every gameplay field.
export async function loadCheckpoint(page, fields) {
  await page.waitForFunction(() => Boolean(localStorage.getItem('yz-test-save')));
  await page.evaluate(fields => {
    const save = JSON.parse(localStorage.getItem('yz-test-save'));
    localStorage.setItem('yz-test-save', JSON.stringify({...save, data:{...save.data,...fields}}));
  }, fields);
  await page.reload();
  const help = page.getByRole('button', {name:'Mengerti'});
  if (await help.isVisible()) await help.click();
  await page.locator('.yzg-headsup').waitFor();
  await page.waitForFunction(() => !document.querySelector('.yzg-loading'));
}
