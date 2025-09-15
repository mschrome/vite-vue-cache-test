import { readFile } from 'fs/promises'
import path from 'path'

export default async function handler(req, res) {
  try {
    const projectRoot = process.cwd()
    let html = ''
    try {
      html = await readFile(path.join(projectRoot, 'dist', 'index.html'), 'utf8')
    } catch (_) {
      html = await readFile(path.join(projectRoot, 'index.html'), 'utf8')
    }

    res.status(404)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(html)
  } catch (error) {
    res.status(404).send('Not Found')
  }
}


