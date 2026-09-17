
export const toggleArrayItem = <T>(
  list: T[],
  setList: React.Dispatch<React.SetStateAction<T[]>>,
  item: T,
) => {
  if (list.includes(item)) {
    setList(list.filter((i) => i !== item));
  } else {
    setList([...list, item]);
  }
};
