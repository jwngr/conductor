const API_URL = 'http://localhost:3000/api';

export const getSavedItems = async () => {
  const response = await fetch(`${API_URL}/saved`);
  if (!response.ok) {
    throw new Error('Failed to fetch saved items');
  }
  return response.json();
};

export const addSavedItem = async (item: {
  url: string;
  title: string;
  timeAdded: number;
  domain: string;
}) => {
  const response = await fetch(`${API_URL}/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    throw new Error('Failed to add saved item');
  }
  return response.json();
};
