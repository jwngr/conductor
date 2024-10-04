import {Link} from 'react-router-dom';

import {Text} from '../components/atoms/Text';
import {useItems} from '../lib/items';

export const HomeScreen: React.FC = () => {
  const {items, isLoading} = useItems();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return <div>No items</div>;
  }

  return (
    <ul>
      {items.map((item) => {
        return (
          <li key={item.id}>
            <Link to={`/items/${item.id}`}>
              <Text as="p" color="red" bold>
                {item.url}
              </Text>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
