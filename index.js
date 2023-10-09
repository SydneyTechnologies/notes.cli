// Application imports

import * as os from "os"; // Importing os
import fs from "fs"; // Importing fs (file system)
import * as path from "path"; // Importing path
import { program } from "commander"; // Importing commander
import { spawn } from "child_process";
import {
  createFolder,
  loadNotes,
  exists,
  createFile,
  appendToFile,
} from "./utils.js"; // Importing createFolder function from utils.js

const PROJECT_NAME = "notes.cli";

program
  .version("1.0.0")
  .description("A simple CLI notes application")
  .name("notes.cli");

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
  .action(() => {
    const notes = loadNotes(folderPath);
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
const homeDir = os.homedir(); // Getting the home directory
const documentsDir = path.join(homeDir, "Documents"); // Getting the documents directory
const folderPath = await createFolder(documentsDir, PROJECT_NAME); // Creating the folder
program.parse(process.argv);
