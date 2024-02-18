import { MongooseError } from './errors';
import { omit } from 'ramda';

export async function mongooseDbOperation(
  operation: any,
  toOmit: string[] = []
): Promise<Object | Object[] | undefined> {
  try {
    const result = await operation();

    if (!result) return undefined;
    
    if (Array.isArray(result))
      return result.map((item: any) => {
        const _result = item.toObject();
        _result._id = _result._id.toString();
        return omit(toOmit, _result);
      });

    const _result = result.toObject();
    _result._id = _result._id.toString();
    return omit(toOmit, _result);
  } catch (e) {
    console.log('error', e);
    throw new MongooseError({ message: 'Error when performing mongoose operation' });
  }
}
