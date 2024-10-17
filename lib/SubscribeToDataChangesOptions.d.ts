export default interface SubscribeToDataChangesOptions<T> {
    channel: string;
    table: string;
    filter?: string;
    onInsert?: (newData: T) => void;
    onUpdate?: (newData: T) => void;
    onDelete?: (oldData: T) => void;
}
//# sourceMappingURL=SubscribeToDataChangesOptions.d.ts.map