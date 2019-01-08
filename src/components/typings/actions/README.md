### Actions

Actions are objects containing information used to update the app's state.

Standard flux action:

```
{
    type: string,
    payload?: any,
    error?: boolean,
    meta?: any,
}
```

### Action Creators

Action creators are functions that return an action.
