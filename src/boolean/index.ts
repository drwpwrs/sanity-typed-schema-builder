import { z } from "zod";

import { createType } from "../types";

import type { SanityTypeDef } from "../types";
import type { Schema } from "@sanity/types";

export const boolean = <ParsedValue = boolean, ResolvedValue = boolean>({
  mock = (faker) => faker.datatype.boolean(),
  zod: zodFn = (zod) => zod as unknown as z.ZodType<ParsedValue, any, boolean>,
  zodResolved,
  ...def
}: SanityTypeDef<
  Schema.BooleanDefinition,
  boolean,
  ParsedValue,
  ResolvedValue
> = {}) =>
  createType({
    mock,
    schema: () => ({
      ...def,
      type: "boolean",
    }),
    zod: zodFn(z.boolean()),
    zodResolved: zodResolved?.(z.boolean()),
  });
