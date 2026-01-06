const TUKUI_ADDON_URL = 'https://api.tukui.org/v1/addon/elvui';
const TUKUI_CHANGELOG_URL = 'https://api.tukui.org/v1/changelog/elvui';
const KV_VERSION_KEY = 'elvui_version';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/status') {
      return new Response('Online');
    }

    if (url.pathname === '/elvui') {
      return proxyDownload(env);
    }

    if (url.pathname === '/check') {
      const result = await checkForUpdate(env);
      return new Response(result);
    }

    if (url.pathname === '/') {
      return Response.redirect('https://nathanielinman.com', 302);
    }

    return new Response('Not Found', { status: 404 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkForUpdate(env));
  }
};

async function checkForUpdate(env) {
  try {
    const response = await fetch(TUKUI_ADDON_URL);
    const data = await response.json();
    const latestVersion = data.version;

    const storedVersion = await env.ELVUI_STATE.get(KV_VERSION_KEY);

    console.log(`Checking new version against "${storedVersion}"`);

    if (storedVersion !== latestVersion) {
      console.log(`A new version is available "${latestVersion}"`);

      const changelogResponse = await fetch(TUKUI_CHANGELOG_URL);
      const changelogText = await changelogResponse.text();

      const [, lastVersionChanges] = changelogText.split('###');
      const truncated = lastVersionChanges.length < 1900
        ? lastVersionChanges
        : lastVersionChanges.slice(0, 1900);

      const changelog = `### ElvUI ${truncated.trim()}\n[Download](${env.DOWNLOAD_URL})`;

      await postToDiscord(env, changelog);
      await env.ELVUI_STATE.put(KV_VERSION_KEY, latestVersion);

      console.log(`Posted update and stored version ${latestVersion}`);
      return `New version ${latestVersion} posted to Discord`;
    } else {
      console.log('No updates, holding for 6 hours.');
      return `No updates found. Current version: ${storedVersion}. Checking again in 6 hours.`;
    }
  } catch (err) {
    console.error('Error checking for update:', err);
    return `Error: ${err.message}`;
  }
}

async function postToDiscord(env, content) {
  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }
}

async function proxyDownload(env) {
  try {
    const response = await fetch(TUKUI_ADDON_URL);
    const data = await response.json();

    const downloadResponse = await fetch(data.url);

    return new Response(downloadResponse.body, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=elvui-${data.version}.zip`
      }
    });
  } catch (err) {
    console.error('Error proxying download:', err);
    return new Response('Download failed', { status: 500 });
  }
}
