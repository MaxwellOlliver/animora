## Validate the profile guards

There is a possible gap for profile related endpoints. Those endpoints must be protected by the profile guard, that checks if the passed profile id is valid and belongs to the user. If the guard is not applied, then it is possible to access data of other profiles by passing their id in the request.

So, every endpoint from the profile selection flow on must be protected by the profile guard.
Like watch history, watchlist, ratings, recommendations, etc.

## Form errors

SignUp is not showing field errors.
