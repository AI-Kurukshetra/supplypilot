export type SearchParamValue = string | string[] | undefined;
export type SearchParamMap = Record<string, SearchParamValue>;

export type FlashState = {
  status?: string;
  message?: string;
};

export function getSearchParam(value: SearchParamValue) {
  return typeof value === "string" ? value : undefined;
}

export function getFlashState(params: SearchParamMap): FlashState {
  return {
    status: getSearchParam(params.status),
    message: getSearchParam(params.message),
  };
}
