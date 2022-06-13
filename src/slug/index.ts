import { z } from "zod";

import { createType } from "../types";

import type { FieldOptionKeys } from "../field";
import type { TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

interface SanitySlug {
  _type: "slug";
  current: string;
}

export const slug = ({
  mock = (faker) => ({
    _type: "slug",
    current: faker.lorem.slug(),
  }),
  ...def
}: Omit<
  TypeValidation<Schema.SlugDefinition, SanitySlug>,
  FieldOptionKeys | "type"
> & {
  mock?: (faker: Faker, path: string) => SanitySlug;
} = {}) =>
  createType({
    mock,
    zod: z
      .object({
        _type: z.literal("slug"),
        current: z.string(),
      })
      .transform(({ current }) => current),
    schema: () => ({
      ...def,
      type: "slug",
    }),
  });
