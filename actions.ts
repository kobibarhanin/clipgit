const os = require('os');
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const CLIPGIT_CONF_FILE = `${os.homedir()}/.clipgit.json`;

let CG_CONF:any;
let CLIPGIT_STAGE: string;
let TRACKED_FILES: Set<string>;
let INCLUDED_FILES: Set<string>;
let EXCLUDED_FILES: Set<string>;

if (fs.existsSync(CLIPGIT_CONF_FILE)){
  CG_CONF = JSON.parse(fs.readFileSync(CLIPGIT_CONF_FILE, "utf8"));
  CLIPGIT_STAGE = CG_CONF["stage_directory"];
  TRACKED_FILES = new Set(CG_CONF["tracked"]);
  INCLUDED_FILES = new Set(CG_CONF["migrations"]["include"]);
  EXCLUDED_FILES= new Set(CG_CONF["migrations"]["exclude"]);
}

export function test() {
  console.log(CG_CONF)
}

export function init(staging_dir:string) {
  const conf ={
    "version": "1.0.0",
    "stage_directory": staging_dir,
    "tracked": [],
    "migrations": { "include": [], "exclude": [] }
  }
  fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(conf));
}

export function show() {
  console.log("Tracked:", Array.from(TRACKED_FILES.values()));
  if (INCLUDED_FILES.size != 0) {
    console.log("Included:", Array.from(INCLUDED_FILES.values()));
  }
  if (EXCLUDED_FILES.size != 0) {
    console.log("Excluded:", Array.from(EXCLUDED_FILES.values()));
  }
}

export function include(file: string) {
  INCLUDED_FILES.add(process.cwd() + "/" + file);
  CG_CONF["migrations"]["include"] = Array.from(INCLUDED_FILES.values());
  fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(CG_CONF));
  console.log(`Added ${file}, file will be synced on next migration`)
}

export function exclude(file: string) {
  const full_file = process.cwd() + "/" + file;
  if (!TRACKED_FILES.has(full_file)) {
    console.log(full_file);
    throw new Error(`${full_file} unknown`);
  }
  EXCLUDED_FILES.add(full_file);
  CG_CONF["migrations"]["exclude"] = Array.from(EXCLUDED_FILES.values());
  fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(CG_CONF));
  console.log(`Removed ${file}, file will be synced on next migration`)
}

export async function commit() {
  await exec(
    `(cd ${CLIPGIT_STAGE} && git add -A && git commit -m "auto commit" && git push)`
  );
}

export async function sync() {
  try {
    console.log("syncing...");
    TRACKED_FILES.forEach((included) => {
      copy_to_stage(included);
      console.log(`-> copied ${included}`);
    });
    await commit();
    console.log("committed to remote");
  } catch (e) {
    console.log((e as Error).message);
  }
}

export async function migrate() {
  try {
    console.log("migrate...");
    EXCLUDED_FILES.forEach((excluded) => {
      removed_from_stage(excluded);
      TRACKED_FILES.delete(excluded);
      console.log(`-> removed ${excluded}`);
    });

    INCLUDED_FILES.forEach((included) => {
      copy_to_stage(included);
      TRACKED_FILES.add(included);
      console.log(`-> copied ${included}`);
    });

    CG_CONF["tracked"] = Array.from(TRACKED_FILES.values());
    CG_CONF["migrations"]["include"] = [];
    CG_CONF["migrations"]["exclude"] = [];
    fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(CG_CONF));
    console.log("updated configs");

    await commit();
    console.log("committed to remote!");
  } catch (e) {
    console.log((e as Error).message);
  }
}

function copy_to_stage(file: string) {
  const f_name = path.basename(file);
  fs.copySync(file, CLIPGIT_STAGE + "/" + f_name);
}

function removed_from_stage(file: string) {
  const f_name = path.basename(file);
  fs.unlinkSync(CLIPGIT_STAGE + "/" + f_name);
}
