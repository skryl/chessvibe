class EloRating
  # Constants for Elo calculation
  K_FACTOR = 32

  # Calculate new Elo ratings after a game
  def self.calculate_rating_changes(game)
    white_rating = game.white_player_rating_before
    black_rating = game.black_player_rating_before

    # Expected score calculation
    expected_white = expected_score(white_rating, black_rating)
    expected_black = expected_score(black_rating, white_rating)

    # Actual score calculation
    if game.winner_id == game.white_player_id
      actual_white = 1.0
      actual_black = 0.0
    elsif game.winner_id == game.black_player_id
      actual_white = 0.0
      actual_black = 1.0
    else # Draw
      actual_white = 0.5
      actual_black = 0.5
    end

    # Rating change calculation
    white_change = (K_FACTOR * (actual_white - expected_white)).round
    black_change = (K_FACTOR * (actual_black - expected_black)).round

    { white: white_change, black: black_change }
  end

  private

  # Calculate expected score based on ratings
  def self.expected_score(rating_a, rating_b)
    1.0 / (1.0 + 10.0 ** ((rating_b - rating_a) / 400.0))
  end
end
