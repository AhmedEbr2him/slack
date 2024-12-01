import { useQueryState } from "nuqs";

// same => [parentMessageId,setParentMessageId] = useState(null) => https://localhost:3000?parentMessageId=null

export const useParentMessageId = () => {
  return useQueryState("parentMessageId");
};
