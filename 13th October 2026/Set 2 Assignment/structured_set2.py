import pandas as pd


df = pd.read_csv('./renewable_energy.csv')

print(df[(df['Energy_Type'] == 'Solar') | (df['Energy_Type'] == 'Wind')])

# Efficiency_Percent = Actual_Output_MW / Capacity_MW * 100
df['Efficiency_Percent'] = 100*(df['Actual_Output_MW']/df['Capacity_MW'])

print(df[df['Efficiency_Percent'] > 85])

print(df['Efficiency_Percent'].mean())

print(df.groupby('Energy_Type')['Maintenance_Cost'].sum())

print(df.loc[df['Actual_Output_MW'].idxmax()])

# Cost_Per_MW = Maintenance_Cost / Actual_Output_MWCost_Per_MW
df['Cost_Per_MW'] = df['Maintenance_Cost'] / df['Actual_Output_MW']
print(df.sort_values('Cost_Per_MW', ascending=True))

print(df[(df['Efficiency_Percent'] > 80) & (df['Maintenance_Cost'] < 70000)])

import matplotlib.pyplot as plt
plt.figure(figsize=(12, 6))
plt.bar(df['Plant_Name'], df['Efficiency_Percent'])
plt.title('Plant Name Vs Efficiency (%)')
plt.xlabel('Plant Name')
plt.ylabel('Efficiency (%)')
plt.show()


