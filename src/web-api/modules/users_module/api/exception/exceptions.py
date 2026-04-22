class UserAlreadyExistsException(Exception):
    pass

class UserNotFoundException(Exception):
    pass

class InvalidUserIdException(Exception):
    pass

class ForbiddenException(Exception):
    pass

class InvalidCredentialsException(Exception):
    pass
