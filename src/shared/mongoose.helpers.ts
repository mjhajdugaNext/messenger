import { MongooseError } from './errors';

export async function mongooseDbOperation(operation: any): Promise<Object | Object[]> {
  try {
    const result = await operation();
    if (Array.isArray(result)) return result.map((item: any) => item.toObject());
    return result.toObject();
  } catch (e) {
    console.log('error', e);
    throw new MongooseError({ message: 'Error when performing mongoose operation' });
  }
}

export async function mongooseDbCollectionOperation(operation: any): Promise<Object[]> {
  try {
    const result = await operation();
    return result.map((item: any) => item.toObject());
  } catch (e) {
    console.log('error', e);
    throw new MongooseError({ message: 'Error when performing mongoose operation' });
  }
}
