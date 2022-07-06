import pkg from 'aws-sdk';
const { DynamoDB } = pkg

export class GeneralRepository {
    constructor() {
        this.docClient = process.env.AWS_SAM_LOCAL ? new DynamoDB.DocumentClient({
            endpoint: "http://host.docker.internal:12345"
        }) : new DynamoDB.DocumentClient();
        this.table = process.env.TB_ITEM_TRACKING ?? 'item-tracking'
    }

    async put(result) {
        const params = {
            TableName: this.table,
            Item: result
        };

        // console.log(`Storing record ${result.pk} in the ${this.table} Table.`);
        await this.docClient.put(params).promise();
        return;
    }

    async getById(id) {
        const params = {
            TableName: this.table,
            Key: {
                "pk": id
            }
        };

        // console.log(`Fetching record ${id} from the ${this.table} Table.`);
        const result = await this.docClient.get(params).promise();
        return result.Item;
    }
}