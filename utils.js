import fs from "fs"; // Importing fs (file system)
import * as path from "path"; // Importing path

export async function exists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK, () => {});
    return true;
  } catch (err) {
    console.log("File does not exist", err);
    return false;
  }
}
export async function createFolder(parentDir, folderName) {
  const folderPath = path.join(parentDir, folderName); // Getting the path of the folder
  if (await !exists(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  return folderPath;
}

export function loadNotes(folderPath) {
  const notes = fs.readdirSync(folderPath);
  return notes.slice(1, notes.length);
}

export async function createFile(fileName, content) {
  await fs.writeFile(fileName, content, () => {});
}

export async function appendToFile(fileName, content) {
  try {
    await fs.appendFile(fileName, content, () => {});
    return true;
  } catch (e) {
    return false;
  }
}
