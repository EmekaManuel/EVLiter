# Backend Validation Fix Required

## Problem

The backend is incorrectly validating the connector ID as a connector type. When a user selects a connector with ID `"station-002-c2"` (which is a CCS connector), the backend checks if `"station-002-c2"` exists in the `connectorTypes` array (which contains `["CCS", "CHAdeMO"]`), causing validation to fail.

## Error Message

```
"Connector type station-002-c2 is not available at this station. Available types: CCS, CHAdeMO"
```

## Frontend Fix (Already Applied)

The frontend now sends both:

- `connectorId`: The connector ID (e.g., `"station-002-c2"`)
- `connectorType`: The connector type (e.g., `"CCS"`)

## Backend Fix Required

In your backend `startChargingSession` function, update the validation logic:

### Current (Incorrect) Code:

```typescript
// Validate connector type is available at this station
if (!station.connectorTypes.includes(request.connectorId)) {
  throw new Error(
    `Connector type ${
      request.connectorId
    } is not available at this station. Available types: ${station.connectorTypes.join(
      ", "
    )}`
  );
}
```

### Fixed Code:

```typescript
// Validate connector type is available at this station
// Use connectorType if provided, otherwise fall back to checking connectorId
const connectorTypeToValidate = request.connectorType || request.connectorId;

if (!station.connectorTypes.includes(connectorTypeToValidate)) {
  throw new Error(
    `Connector type ${connectorTypeToValidate} is not available at this station. Available types: ${station.connectorTypes.join(
      ", "
    )}`
  );
}

// Store the connector type (not the ID) for the session
const sessionConnectorType = request.connectorType || connectorTypeToValidate;
```

### Better Fix (Recommended):

If you want to validate that the connector ID actually belongs to the station, you would need to:

1. Store connector details in your database/model
2. Validate that `connectorId` exists and belongs to `stationId`
3. Extract the connector type from the connector record

For now, the simple fix above using `connectorType` will work.
