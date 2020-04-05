import "./chrome-cookies";

import * as childProcess from "child_process";
import * as path from "path";

type Cookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
};

export const cookies = (domain: string): Cookie[] => {
  const jsonString = childProcess
    .execSync(`(cd ${path.resolve(__dirname)} && ./chrome-cookies -d ${domain})`)
    .toString();

  return JSON.parse(jsonString).map((json: Cookie) => ({
    name: json.name,
    value: json.value,
    domain: json.domain,
    path: json.path,
    expires: json.expires,
    httpOnly: json.httpOnly,
    secure: json.secure,
  }));
};
