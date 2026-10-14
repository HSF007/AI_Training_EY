import pandas as pd


df = pd.read_csv('./structured_data.csv')

print('\n', df[['Shipment_ID', 'Origin', 'Destination', 'Cost']])

print('\n', df[df['Mode']=='Road'])

print('\n', df[df['Weight_Kg'] > 150])

df['Cost_Per_Km'] = df['Cost'] / df['Distance_Km']

print('\n','Average shipping cost:', df['Cost'].mean())

print('\n', 'Highest shipping cost', df['Cost'].max())

print('\n', 'Lowest shipping cost', df['Cost'].min())

print('\n', 'Total shipping cost for each mode\n', df.groupby('Mode')['Cost'].sum())

print('\n', 'Average weight for each mode\n', df.groupby('Mode')['Weight_Kg'].mean())

print('\n', df.sort_values("Cost", ascending=False))

print('\n', df[(df['Delivery_Days'] <= 1) & (df['Cost'] < 5000)])