const express = require('express');

const router = express.Router();

// GET /api/v1/resolve-url?url=<encodedUrl>
// Resuelve un link corto (ej: maps.app.goo.gl) siguiendo redirects server-side
router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    res.json({ resolved: response.url });
  } catch (error) {
    console.error('Error resolviendo URL:', error);
    res.status(500).json({ error: 'No se pudo resolver la URL', resolved: url });
  }
});

module.exports = router;
