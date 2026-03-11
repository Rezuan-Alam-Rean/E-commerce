type SearchParams = { [key: string]: string | string[] | undefined };

export async function handleCheckoutDraftsParams(searchParamsPromise: Promise<SearchParams>) {
    const params = await searchParamsPromise;

    const pageStr = Array.isArray(params.page) ? params.page[0] : params.page;
    const rawPage = pageStr ? parseInt(pageStr, 10) : 1;
    const page = isNaN(rawPage) ? 1 : Math.max(1, rawPage) - 1; // 0-indexed internally

    const limitStr = Array.isArray(params.limit) ? params.limit[0] : params.limit;
    const rawLimit = limitStr ? parseInt(limitStr, 10) : 10;
    const limit = isNaN(rawLimit) ? 10 : Math.max(1, rawLimit);

    return { page, limit };
}
