const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
  ScanCommand,
  DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { TableName, Region } = process.env;
const client = new DynamoDBClient({ region: Region});
const ddbClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async (event) => {
  try {
    const { limit, page } = event.args, offsetLimit = limit * (page-1);
    let total = offsetLimit;
    const param = {
      TableName,
      Limit: limit,
      ScanIndexForward: false
    };
    
    // skip records (if needed) before fetching the required page
    if (page > 1) {
      param.Limit = offsetLimit;
      const { LastEvaluatedKey } = await ddbClient.send(new ScanCommand(param));
      param["ExclusiveStartKey"] = LastEvaluatedKey; param.Limit = limit;
    }
    // get the required records
    const { Items, ScannedCount, LastEvaluatedKey } = await ddbClient.send(new ScanCommand(param));

    // get the total records count
    total = await getTotalNoDocs(LastEvaluatedKey, param, total+ScannedCount); 

    // calculate the total no of pages available
    const noOfPages = Math.ceil(total / limit) || 1;
    return {
      total,
      items: Items,
      noOfPages,
      hasPrevPage: page > 1,
      hasNextPage: page < noOfPages
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const getTotalNoDocs = async (cursor, param, total) => {
  if (cursor) {
    param.ExclusiveStartKey = cursor;
    // increase the limit to reduce invocation times
    param.Limit = 25;
    const { LastEvaluatedKey, ScannedCount } = await ddbClient.send(new ScanCommand(param));
    total += ScannedCount;
    if (LastEvaluatedKey) {
      return await getTotalNoDocs(LastEvaluatedKey, param, total);
    }
    return total;
  }
  return total
}