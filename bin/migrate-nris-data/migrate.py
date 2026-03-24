import click
from rich.console import Console

from common.constants import BATCH_UPLOAD_SIZE
import ce_files
import complaint
import inspection
import properties
import responsible_parties
import submitters

console = Console()


@click.group()
def cli():
    pass


@cli.group()
def import_csv():
    pass


@import_csv.command("complaint")
@click.argument("csv_file", type=click.File("r"))
def import_complaint_csv(csv_file):
    console.log("Starting complaint import from CSV...")
    complaint.create_table()
    complaint.import_csv(csv_file)
    console.log("Complaint import complete.")


@import_csv.command("inspection")
@click.argument("csv_file", type=click.File("r"))
def import_inspection_csv(csv_file):
    console.log("Starting inspection import from CSV...")
    inspection.create_table()
    inspection.import_csv(csv_file)
    inspection.reduce_related_records()
    inspection.relate_inspections_to_complaints()
    console.log("Inspection import complete.")


@cli.group(
    chain=True,
    invoke_without_command=True,
    help="Runs all ETL subcommands in sequence if no subcommand is specified.",
)
@click.option(
    "--batch-size",
    default=BATCH_UPLOAD_SIZE,
    help=f"batch size (default: {BATCH_UPLOAD_SIZE})",
    type=int,
)
@click.pass_context
def etl(ctx, batch_size):
    console.log(f"Start ETL in batches of {batch_size}...")

    if ctx.invoked_subcommand is None:
        # Order matters
        ctx.invoke(etl_ce_files)
        ctx.invoke(etl_submitters)
        ctx.invoke(etl_responsible_parties)
        ctx.invoke(etl_properties)


@etl.command("ce-files")
@click.pass_context
def etl_ce_files(ctx):
    console.log("Start C&E file ETL...")
    ce_files.etl(batch_size=ctx.parent.params["batch_size"])
    console.log("C&E file ETL complete.")


@etl.command("submitters")
@click.pass_context
def etl_submitters(ctx):
    console.log("Start submitter ETL...")
    submitters.etl(batch_size=ctx.parent.params["batch_size"])
    console.log("Submitter ETL complete.")


@etl.command("responsible-parties")
@click.pass_context
def etl_responsible_parties(ctx):
    console.log("Start responsible ETL...")
    responsible_parties.etl(batch_size=ctx.parent.params["batch_size"])
    console.log("Responsible party ETL complete.")


@etl.command("properties")
@click.pass_context
def etl_properties(ctx):
    console.log("Start properties ETL...")
    properties.etl(batch_size=ctx.parent.params["batch_size"])
    console.log("Property ETL complete.")


@etl.result_callback()
def etl_cleanup(results, batch_size):
    console.log("ETL complete. Cleaning up...")
    # Any import cleanup can go here.
    console.log("Cleanup complete.")


@cli.group(
    chain=True,
    invoke_without_command=True,
    help="Obfuscates all data in sequence if no subcommand is specified.",
)
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
        ctx.invoke(obfuscate_submitters)
        ctx.invoke(obfuscate_responsible_parties)
        ctx.invoke(obfuscate_properties)


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
    submitters.obfuscate(batch_size=ctx.parent.params["batch_size"])
    console.log("Submitter obfuscation complete.")


@obfuscate.command("responsible-parties")
@click.pass_context
def obfuscate_responsible_parties(ctx):
    console.log("Start obfuscating responsible parties...")
    responsible_parties.obfuscate(batch_size=ctx.parent.params["batch_size"])
    console.log("Responsible party obfuscation complete.")


@obfuscate.command("properties")
@click.pass_context
def obfuscate_properties(ctx):
    console.log("Start obfuscating properties...")
    properties.obfuscate(batch_size=ctx.parent.params["batch_size"])
    console.log("Property obfuscation complete.")


@obfuscate.result_callback()
def obfuscation_cleanup(results, batch_size):
    console.log("All obfuscation complete. Cleaning up...")
    # Any obfuscation cleanup can go here.
    console.log("Cleanup complete.")


if __name__ == "__main__":
    cli()
