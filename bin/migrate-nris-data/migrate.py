import click
from rich.console import Console

from common.constants import BATCH_UPLOAD_SIZE
import ce_files
import submitters

console = Console()


@click.group()
def cli():
    pass


@cli.group(chain=True, invoke_without_command=True, help="Runs all imports in sequence if no subcommand is specified.")
@click.option(
    "--batch-size",
    default=BATCH_UPLOAD_SIZE,
    help=f"batch size (default: {BATCH_UPLOAD_SIZE})",
    type=int,
)
@click.pass_context
def import_data(ctx, batch_size):
    console.log(f"Start import in batches of {batch_size}...")

    if ctx.invoked_subcommand is None:
        # Order matters
        ctx.invoke(import_ce_files)
        ctx.invoke(import_submitters)


@import_data.command("ce-files")
@click.pass_context
def import_ce_files(ctx):
    console.log("Start importing C&E files...")
    ce_files.etl(batch_size=ctx.parent.params["batch_size"])
    console.log("C&E file import complete.")


@import_data.command("submitters")
@click.pass_context
def import_submitters(ctx):
    console.log("Start importing submitters...")
    submitters.etl(batch_size=ctx.parent.params["batch_size"])
    console.log("Submitter import complete.")


@import_data.result_callback()
def import_cleanup(results, batch_size):
    console.log("All imports complete. Cleaning up...")
    # Any import cleanup can go here.
    console.log("Cleanup complete.")


@cli.group(chain=True, invoke_without_command=True, help="Obfuscates all data in sequence if no subcommand is specified.")
@click.option(
    "--batch-size",
    default=BATCH_UPLOAD_SIZE,
    help=f"batch size (default: {BATCH_UPLOAD_SIZE})",
    type=int,
)
@click.pass_context
def obfuscate(ctx, batch_size):
    console.log(f"Start data obfuscation in batches of {batch_size}...")

    if ctx.invoked_subcommand is None:
        # Order matters
        ctx.invoke(obfuscate_ce_files)
        # ctx.invoke(obfuscate_submitters)


@obfuscate.command("ce-files")
@click.pass_context
def obfuscate_ce_files(ctx):
    console.log("Start obfuscating C&E files...")
    ce_files.obfuscate(batch_size=ctx.parent.params["batch_size"])
    console.log("C&E file obfuscation complete.")


@obfuscate.command("submitters")
@click.pass_context
def obfuscate_submitters(ctx):
    console.log("Start obfuscating submitters...")
    submitters.obfuscate_submitters(batch_size=ctx.parent.params["batch_size"])
    console.log("Submitter obfuscation complete.")


@obfuscate.result_callback()
def obfuscation_cleanup(results, batch_size):
    console.log("All obfuscation complete. Cleaning up...")
    # Any obfuscation cleanup can go here.
    console.log("Cleanup complete.")


if __name__ == "__main__":
    cli()
