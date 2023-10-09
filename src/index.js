#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const { spawn } = require("child_process");

const PROJECT_NAME = "notes.cli";

async function exists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    console.log("File does not exist", err);
    return false;
  }
}

async function createFolder(parentDir, folderName) {
  const folderPath = path.join(parentDir, folderName);
  if (!(await exists(folderPath))) {
    fs.mkdirSync(folderPath);
  }
  return folderPath;
}

async function loadNotes(folderPath) {
  try {
    const notes = await fs.promises.readdir(folderPath);
    return notes.slice(1, notes.length);
  } catch (error) {
    console.error("Error reading directory:", error);
    return []; // or handle the error in an appropriate way for your use case
  }
}

async function createFile(fileName, content) {
  await fs.promises.writeFile(fileName, content);
}

async function appendToFile(fileName, content) {
  try {
    await fs.promises.appendFile(fileName, content);
    return true;
  } catch (e) {
    return false;
  }
}

program
  .version("1.0.0")
  .description("A simple CLI notes application")
  .name("notes.shell");

program.option("-v, --vim", "Open Vim editor to create or edit files");
program.option("-m, --message <content>", "Add message or content to the file");

program
  .command("add <note>")
  .description("Add a note")
  .action(async (fileName) => {
    const options = program.opts();
    if (options.vim) {
      const vim = spawn("vim", [`${folderPath}/${fileName}`], {
        stdio: "inherit",
      });
    } else if (options.message) {
      console.log(options.message);

      await createFile(`${folderPath}/${fileName}`, options.message);
    }
    console.log("[OK]");
  });

program
  .command("view <fileName>")
  .description("View a note")
  .action(async (fileName) => {
    const noteExists = await exists(`${folderPath}/${fileName}`);
    if (!noteExists) {
      console.log("Note does not exist.");
      return;
    }
    const noteContent = fs.readFileSync(`${folderPath}/${fileName}`, "utf-8");
    console.log(noteContent);
  });

program
  .command("list")
  .description("List all notes")
  .action(async () => {
    const notes = await loadNotes(folderPath);
    if (notes.length === 0) {
      console.log("[Empty List]");
    }
    notes.forEach((note, index) => console.log(`${index + 1}. ${note}`));
  });

program
  .command("edit <fileName>")
  .description("Edit notes using Vim")
  .action(async (fileName) => {
    const options = program.opts();
    const noteExists = await exists(`${folderPath}/${fileName}`);
    if (!noteExists) {
      console.log("Note does not exist.");
      return;
    }
    if (options.message) {
      await appendToFile(`${folderPath}/${fileName}`, options.message);
    } else {
      const vim = spawn("vim", [`${folderPath}/${fileName}`], {
        stdio: "inherit",
      });
    }
    console.log("[OK]");
  });

program
  .command("delete <fileName>")
  .description("Delete a note")
  .action(async (fileName) => {
    const noteExists = await exists(`${folderPath}/${fileName}`);
    if (!noteExists) {
      console.log("Note does not exist.");
      return;
    }
    fs.unlinkSync(`${folderPath}/${fileName}`);
    console.log("[OK]");
  });

// Create a folder with the name of the project. So files can be stored there.
const homeDir = os.homedir();
const documentsDir = path.join(homeDir, "Documents");
let folderPath = "";
createFolder(documentsDir, PROJECT_NAME).then((folder) => {
  folderPath = folder;
  program.parse(process.argv);
});
