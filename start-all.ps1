# Start Core
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd core; mvn spring-boot:run"

# Wait a bit for core to start
Start-Sleep -Seconds 10

# Start BFF
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd bff; npm run dev"

# Wait a bit for BFF to start
Start-Sleep -Seconds 5

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
