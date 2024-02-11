import { MongooseError } from './errors';

export async function mongooseDbOperation(operation: any): Promise<Object | Object[]> {
  try {
    const result = await operation();
    if (Array.isArray(result))
      return result.map((item: any) => {
        const _result = item.toObject();
        _result._id = _result._id.toString();
        return _result;
      });

    const _result = result.toObject();
    _result._id = _result._id.toString();
    return _result;
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
