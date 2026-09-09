perl -0777 -pi -e 's/(<label[^>]*>\s*Monthly Kist \(PKR\)\s*<\/label>\s*<input[^>]*?)required\s*(\/>)/$1$2/g' src/views/AdminView.tsx
perl -0777 -pi -e 's/(<label[^>]*>\s*Token Price \(PKR\)\s*<\/label>\s*<input[^>]*?)required\s*(\/>)/$1$2/g' src/views/AdminView.tsx
perl -0777 -pi -e 's/(<label[^>]*>\s*Duration \(Months\)\s*<\/label>\s*<input[^>]*?)required\s*(\/>)/$1$2/g' src/views/AdminView.tsx
perl -0777 -pi -e 's/(<label[^>]*>\s*Total Seats \/ Members\s*<\/label>\s*<input[^>]*?)required\s*(\/>)/$1$2/g' src/views/AdminView.tsx
