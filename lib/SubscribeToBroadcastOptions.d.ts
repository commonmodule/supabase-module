export default interface SubscribeToBroadcastOptions<T extends {
    [key: string]: any;
}> {
    listeners: {
        [Event in string]: (message: T) => void;
    };
}
//# sourceMappingURL=SubscribeToBroadcastOptions.d.ts.map