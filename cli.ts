const cli = require("commander");
const {
  include,
  exclude,
  commit,
  sync,
  migrate,
  show,
  init,
  test
} = require("./actions");

cli.version("0.0.1");

cli
  .command("test")
  .description("...")
  .action(() => {
    test()
});

cli
  .command("init <staging_directory>")
  .description("initializes the clipgit.json")
  .action((staging_directory:string) => {
    init(staging_directory);
});

cli
  .command("include [file]")
  .description("add a file to the clip")
  .action((file: string) => {
    include(file);
  });

cli
  .command("exclude [file]")
  .description("removes a file from the clip")
  .action((file: string) => {
    try {
      exclude(file);
    } catch (e) {
      console.log((e as Error).message);
    }
  });

cli
  .command("commit")
  .description("commits clip to remote")
  .action(async () => {
    await commit();
  });

cli
  .command("sync")
  .description("syncs tracked clip to remote")
  .action(async () => {
    await sync();
  });

cli
  .command("migrate")
  .description("migrate clip changes to remote")
  .action(async () => {
    await migrate();
  });

cli
  .command("show")
  .description("show clip")
  .action(async () => {
    await show();
  });

(async () => {
  try {
    await cli.parse(process.argv);
  } catch (e) {
    console.log((e as Error).message);
  }
})();
