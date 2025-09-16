import { readFile } from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  try {
    const projectRoot = process.cwd()
    let html = ''
    // 内置路由白名单（正则），命中则返回 200，否则 404
    const allowedRoutePatterns = [
      /^\/$/,
      /^\/test$/,
    ]
    const urlPath = req.path || new URL(req.url, 'http://localhost').pathname
    const isKnownRoute = allowedRoutePatterns.some((re) => re.test(urlPath))
    try {
      html = await readFile(path.join(projectRoot, 'dist', 'index.html'), 'utf8')
    } catch (_) {
      html = await readFile(path.join(projectRoot, 'index.html'), 'utf8')
    }

    res.status(isKnownRoute ? 200 : 404)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(html)
  } catch (error) {
    res.status(404).send('Not Found')
  }
}


