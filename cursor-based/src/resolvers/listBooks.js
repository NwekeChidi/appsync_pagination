import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "Scan",
    limit: ctx.args.input.limit ?? 10,
    nextToken: ctx.args.input.nextToken
  }
}

export function response(ctx) {
  if (ctx.error) return util.error("Books Not Found");
  return {
    books: ctx.result.items,
    nextToken: ctx.result.nextToken
  };
}