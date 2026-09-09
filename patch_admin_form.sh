sed -i 's/Monthly Kist (PKR) \*/Monthly Kist (PKR)/' src/views/AdminView.tsx
sed -i 's/Token Price (PKR) \*/Token Price (PKR)/' src/views/AdminView.tsx
sed -i 's/Duration (Months) \*/Duration (Months)/' src/views/AdminView.tsx
sed -i 's/Total Seats \/ Members \*/Total Seats \/ Members/' src/views/AdminView.tsx

# Also need to remove the "required" attribute from these inputs.
# Let's do this more precisely with awk or perl, or just edit the file.
