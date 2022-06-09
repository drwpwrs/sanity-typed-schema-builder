import { z } from "zod";

import { preview } from "../field";
import { createType } from "../types";

import type {
  FieldOptionKeys,
  FieldsType,
  InferFieldsZod,
  Preview,
} from "../field";
import type { SanityType, TypeValidation } from "../types";
import type { Faker } from "@faker-js/faker";
import type { Schema } from "@sanity/types";

type ZodObjectNamed<
  ObjectNames extends string,
  Fields extends FieldsType<any, any>
> = z.ZodIntersection<
  InferFieldsZod<Fields>,
  z.ZodObject<{
    _type: z.ZodLiteral<ObjectNames>;
  }>
>;

interface ObjectNamedType<
  ObjectNames extends string,
  Fields extends FieldsType<any, any>
> extends SanityType<
    TypeValidation<
      Schema.ObjectDefinition,
      z.input<ZodObjectNamed<ObjectNames, Fields>>
    > & { name: ObjectNames },
    ZodObjectNamed<ObjectNames, Fields>
  > {
  ref: () => SanityType<
    Omit<Schema.TypeReference<any>, FieldOptionKeys> & { type: ObjectNames },
    ZodObjectNamed<ObjectNames, Fields>
  >;
}

export const objectNamed = <
  ObjectNames extends string,
  Fields extends FieldsType<any, any>,
  // eslint-disable-next-line @typescript-eslint/ban-types -- All other values assume keys
  Select extends Record<string, string> = {}
>({
  name,
  preview: previewDef,
  fields: { schema: fieldsSchema, mock: fieldsMock, zod: fieldsZod },
  mock = (faker) => ({
    ...(fieldsMock(faker) as z.input<InferFieldsZod<Fields>>),
    _type: name,
  }),
  ...def
}: Omit<
  TypeValidation<
    Schema.ObjectDefinition,
    z.input<ZodObjectNamed<ObjectNames, Fields>>
  >,
  "fields" | "name" | "preview" | "type"
> & {
  fields: Fields;
  mock?: (faker: Faker) => z.input<ZodObjectNamed<ObjectNames, Fields>>;
  name: ObjectNames;
  preview?: Preview<z.input<ZodObjectNamed<ObjectNames, Fields>>, Select>;
}): ObjectNamedType<ObjectNames, Fields> => {
  const zod = z.intersection(
    fieldsZod as InferFieldsZod<Fields>,
    z.object({
      _type: z.literal(name),
    })
  ) as unknown as ZodObjectNamed<ObjectNames, Fields>;

  return {
    ...createType({
      mock,
      zod,
      schema: () => {
        const schemaForFields = fieldsSchema();

        return {
          ...def,
          name,
          type: "object",
          fields: schemaForFields,
          preview: preview<
            z.input<ZodObjectNamed<ObjectNames, Fields>>,
            Select
          >(previewDef, schemaForFields),
        };
      },
    }),
    ref: () =>
      createType({
        mock,
        zod,
        schema: () => ({ type: name }),
      }),
  };
};
