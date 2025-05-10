
export function formatToCustomDate(eventDate: Date | null): string {
    if (eventDate == null)
        return ``;

    const date = new Date(eventDate);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const dayOfWeek = date.toLocaleDateString('en-US', options);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${dayOfWeek} ${day}/${month}/${year}`;
}