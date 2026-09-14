import { Dispatch, SetStateAction } from "react";

export const toggleFilter = (
  filter: string,
  type: "TYPE" | "CATE",
  selectedTypes: string[],
  setSelectedTypes: Dispatch<SetStateAction<string[]>>,
  selectedCategories: string[],
  setSelectedCategories: Dispatch<SetStateAction<string[]>>,
) => {
  const isType = type === "TYPE";
  const currentList = isType ? selectedTypes : selectedCategories;
  const setList = isType ? setSelectedTypes : setSelectedCategories;
  if (filter === "전체") {
    setList(["전체"]);
    return;
  }
  let newList = currentList.filter((item) => item !== "전체");
  if (newList.includes(filter)) {
    newList = newList.filter((item) => item !== filter);
    if (newList.length === 0) newList = ["전체"];
  } else {
    if (isType) {
      if (filter === "오늘 열리는")
        newList = newList.filter((item) => item !== "내일 열리는");
      else if (filter === "내일 열리는")
        newList = newList.filter((item) => item !== "오늘 열리는");
    }
    newList.push(filter);
  }
  setList(newList);
};
