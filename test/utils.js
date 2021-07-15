import { readFile } from "fs/promises";
import { buildASTSchema, GraphQLSchema, parse, print } from "graphql";
import matter from "gray-matter";
import { Remarkable } from "remarkable";
import * as predicates from "./__fixtures__/predicates.js";

const markdown = new Remarkable();

/**
 * @param {string} name
 * @returns {Promise<{
 *  input: {
 *    schema: GraphQLSchema;
 *    operation: import("graphql").DocumentNode;
 *    predicate: (_: any) => any;
 *    data: any;
 *  };
 *  output: {
 *    operation?: string;
 *    masks: string[][];
 *    error?: string;
 *    enriched: any;
 *  }
 * }>}
 */
export async function parseFixture(name) {
  const fixtureText = await readFile(name, "utf-8");
  const { data: frontMatter, content } = matter(fixtureText);
  const tokens = markdown.parse(content, {});

  const codeBlocks = tokens.filter(
    /** @type {(_: any) => _ is Remarkable.FenceToken} */
    ((t) => t.type === "fence")
  );

  const named = codeBlocks.reduce((map, block) => {
    const [lang, name] = block.params.split(" ");
    const content = parseBlockContent(block.content, lang, name);

    if (map[name]) {
      // support arrays of blocks with the same name
      map[name] = [
        ...(Array.isArray(map[name]) ? map[name] : [map[name]]),
        content,
      ];
    } else {
      map[name] = content;
    }

    return map;
  }, /** @type {{ [key: string]: any }} */ ({}));

  // @ts-ignore
  const predicate = predicates[frontMatter.predicate];

  if (!predicate) {
    throw new Error(`no predicate function found for ${frontMatter.predicate}`);
  }

  return {
    input: {
      schema: buildASTSchema(named.schema),
      operation: named.operation,
      predicate,
      data: named.data,
    },
    output: {
      operation: named.result ? print(named.result) : undefined,
      masks: named.masks,
      error: named.error,
      enriched: named.enriched,
    },
  };
}

/**
 * @param {string} content
 * @param {'graphql' | 'json' | string | undefined} lang
 * @param {string} name
 */
function parseBlockContent(content, lang, name) {
  switch (lang) {
    case "graphql":
      try {
        return parse(content);
      } catch (e) {
        throw new Error(`Error parsing graphql ${name} block:\n${e}`);
      }

    case "json":
      try {
        return JSON.parse(content);
      } catch (e) {
        throw new Error(`Error parsing json ${name} block:\n${e}`);
      }

    default:
      throw new Error(`cannot parse block content for language ${lang}`);
  }
}
