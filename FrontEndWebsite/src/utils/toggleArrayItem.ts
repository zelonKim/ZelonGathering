export const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
  ) => {
    if (list.includes(item)) setList(list.filter((x) => x !== item));
    else setList([...list, item]);
  };
