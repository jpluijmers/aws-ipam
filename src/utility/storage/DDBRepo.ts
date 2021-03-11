import {
    DeleteItemCommand,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    ScanCommand, ScanCommandInput, ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {DDBDto} from "./DDBDto";

export class DDBRepo<T extends DDBDto>{
    private client: DynamoDBClient;

    constructor(private table: string, private key: string) {
        this.client = new DynamoDBClient({region: process.env.AWS_REGION});
    }

    /**
     * Read from DynamoDb by key
     *
     * @param key
     */
    public async read(key: string): Promise<T> {
        let command = new GetItemCommand({
            TableName: this.table,
            Key: {
                [this.key]: {S: key}
            }
        });

        return this.client.send(command).then(result => {
            if ( result.Item === undefined ){
                throw new Error(`No record found with key: ${key}`);
            }
            return unmarshall(result.Item) as T;
        });
    }

    /**
     * Write object to DynamoDb
     *
     * @param input
     */
    public async write(input: T): Promise<string>{
        let command = new PutItemCommand({
            TableName: this.table,
            Item: marshall(input)
        })

        return this.client.send(command).then(result => {
            return 'written'
        });
    }

    /**
     * Delete object by key
     *
     * @param key
     */
    public async delete(key: string): Promise<string>{
        let command = new DeleteItemCommand({
            TableName: this.table,
            Key: marshall({[this.key]:key})
        });
        return this.client.send(command).then(result => {
            return 'Deleted';
        });
    }

    /**
     * Fetch all items matching scan parameters. Abstracts DynamoDb paging.
     *
     * @param params
     */
    public async scan(params : DDBDto): Promise<T[]>{
        const command = <ScanCommandInput>{
            TableName: this.table,
            ConsistentRead: true,
            Limit: 10,
            FilterExpression: this.objectToFilterExpression(params),
            ExpressionAttributeNames: this.objectToFilterExpressionNames(params),
            ExpressionAttributeValues: marshall(this.objectToFilterExpressionValues(params))
        };

        return new Promise<T[]>(async (resolve, reject) =>  {
            const items : T[] = [];

            do{
                var result = await this.client.send<ScanCommandInput, ScanCommandOutput>(new ScanCommand(command));
                for( var i in result.Items ){
                    items.push(unmarshall(result.Items[i]) as T);
                }

                command.ExclusiveStartKey = result.LastEvaluatedKey;
            }while ( result.LastEvaluatedKey !== undefined);

            resolve(items);
        });
    }

    /**
     * Find exactly one item in DynamoDb, uses scan.
     *
     * @param params
     */
    public async scanFindExactlyOne(params: object): Promise<T>{
        return new Promise<T>(async (resolve, reject) =>  {
            const result = await this.scan(params);
            if ( result.length === 0 ){
                reject(new Error("No results found for scan params: " + JSON.stringify(params)));
                return;
            }
            if ( result.length > 1 ){
                reject(new Error("More than exactly one result found for scan params: " + JSON.stringify(params)));
                return;
            }
            resolve(result.shift());
        });
    }

    /**
     * Map parameters object to FilterExpression
     *
     * @param params
     */
    public objectToFilterExpression(params: object): string{
        return Object.keys(params).map(key => { return `#${key} = :${key}`}).join(' and ');
    }

    /**
     * Map parameters object to ExpressionAttributeNames
     *
     * @param params
     */
    public objectToFilterExpressionValues(params: DDBDto): object{
        var mapped = <DDBDto>{};
        Object.keys(params).map(key => {
            const sub = `:${key}`;
            mapped[sub] = params[key]
        });
        return mapped;
    }

    /**
     * Map parameters object to ExpressionAttributeValues
     *
     * @param params
     */
    public objectToFilterExpressionNames(params: DDBDto): { [key: string]: string }{
        var mapped = <DDBDto>{};
        Object.keys(params).map(key => {
            const sub = `#${key}`;
            mapped[sub] = key
        });
        return mapped;
    }
}
