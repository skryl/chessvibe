# Create some sample users
user1 = User.create!(username: 'alex')
user2 = User.create!(username: 'steven')

puts "Created sample users: #{user1.username}, #{user2.username}"

# Create a sample game
game = Game.create!(white_player: user1, black_player: user2)

puts "Created sample game ID: #{game.id}"