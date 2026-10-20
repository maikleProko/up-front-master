import { message } from "antd";

export const notifyStub = (text = "Раздел находится в разработке") => message.info(text);
