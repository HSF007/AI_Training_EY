import pandas as pd

df = pd.read_csv("./library_loans.csv")


print(df[["Member_Name", "Book_Category", "Fine"]])

print("Member with Fine more than 50 ")
print(df[df["Fine"] > 50])

df["Status"] = "Fine Due"
df.loc[df["Fine"]==0, "status"] = "No Fine"

print("Average number of days borrowed:", df["Days_Borrowed"].mean())


print(df.groupby("Book_Category")["Fine"].sum())