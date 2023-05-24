const fs = require('fs');
const path = require('path');
const config = require('../../../utils/config');

class LocalStorageService {
  /**
   * @param {fs.PathLike} folder
   */
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  /**
   * Write a file to storage.
   * @param {fs.ReadStream} file The file stream.
   * @param {object} meta The file metadata.
   * @param {string} meta.filename The file original name.
   * @param {string} meta.mimetype The file mimetype.
   * @returns {Promise<string>} The url to file location.
   */
  writeFile(file, meta) {
    const filename = `${Date.now()}_${meta.filename}`;
    const filePath = path.resolve(this._folder, filename);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', reject);
      file.pipe(fileStream);
      file.on('end', () => resolve(
        `${config.app.url}/files/${filename}`,
      ));
    });
  }

  /**
   * Delete a file from storage.
   * @param {string} fileUrl The file url.
   * @returns {Promise<void>}
   * @throws If failed when deleting the file.
   */
  deleteFile(fileUrl) {
    const filename = fileUrl.split('/').pop();
    const filePath = path.resolve(this._folder, filename);

    return new Promise((resolve, reject) => {
      // Make sure if file exists
      if (!fs.existsSync(filePath)) {
        resolve();
      }

      fs.unlink(filePath, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

module.exports = LocalStorageService;
