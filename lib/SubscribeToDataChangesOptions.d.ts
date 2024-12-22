export default interface SubscribeToDataChangesOptions<T extends {
    [key: string]: any;
}> {
    channel: string;
    table: string;
    filter?: string;
    onSubscribe: () => void;
    onInsert?: (newData: T) => void;
    onUpdate?: (newData: T) => void;
    onDelete?: (oldData: T) => void;
}
//# sourceMappingURL=SubscribeToDataChangesOptions.d.ts.map