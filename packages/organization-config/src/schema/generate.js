/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { compile } from "json-schema-to-typescript"

/**
 * Adjust the generated types definition with manual edits and string replacements
 * @type {(types: string) => string}
 **/
function tweakTypesDef(types) {
  return types.replace(
    "[k: string]: MfeConfig;",
    "[k: string]: MfeConfig | undefined;",
  )
}

/**
 * Main function to generate types from the remote JSON schema
 * @type {(schemaUrl: string) => Promise<void>}
 **/
async function generateTypeFromRemoteSchema(schemaUrl) {
  const schema = await fetch(schemaUrl)
  /** @type {import("json-schema-to-typescript").JSONSchema} */
  const json = await schema.json()
  const types = await compile(json, "OrganizationConfigSchema")

  const destinationFolder = path.dirname(fileURLToPath(import.meta.url))
  const fileName = path.join(destinationFolder, "types.ts")
  fs.writeFileSync(fileName, tweakTypesDef(types))

  console.log("Types generated successfully! 🎉")
}

void generateTypeFromRemoteSchema(
  "https://provisioning.commercelayer.co/api/public/schemas/organization_config",
)
