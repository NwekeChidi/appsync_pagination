import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return {
    operation: "Invoke",
    payload: {
      field: "offset pagination",
      args: {
        limit: ctx.args.input.limit ?? 10,
        page: ctx.args.input.page ?? 1
      }
    }
  }
}

export function response(ctx) {
  if (ctx.error) return util.error("Books Not Found");
  return {
    books: ctx.result.items,
    totalRecords: ctx.result.total,
    noOfPages: ctx.result.noOfPages,
    hasPrevPage: ctx.result.hasPrevPage,
    hasNextPage: ctx.result.hasNextPage
  };
}