export default interface SubscribeToBroadcastOptions<T extends {
    [key: string]: any;
}> {
    channel: string;
    listeners: {
        [Event in string]: (message: T) => void;
    };
}
//# sourceMappingURL=SubscribeToBroadcastOptions.d.ts.map